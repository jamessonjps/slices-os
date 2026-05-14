/**
 * Executa uma requisição com Exponential Backoff e Jitter (±10%).
 * Lê o campo `retryDelay` do JSON de erro (se disponível) ou usa 5s como base.
 *
 * @param {Function} apiCall - Uma função que retorna a Promise da sua chamada (ex: fetch).
 * @param {number} maxRetries - Limite de tentativas (padrão: 5).
 * @param {number} defaultBaseDelayMs - Atraso base se não houver retryDelay (padrão: 5000ms).
 * @returns {Promise<any>} O resultado da chamada da API.
 */
export async function fetchWithExponentialBackoff(
  apiCall, 
  maxRetries = 5, 
  defaultBaseDelayMs = 5000
) {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // 1. Tenta realizar a chamada à API
      const result = await apiCall();
      return result; 
      
    } catch (error) {
      attempt++;

      // 2. Se falhar e atingir o limite, para e exibe mensagem amigável
      if (attempt >= maxRetries) {
        const mensagemAmigavel = `O serviço está temporariamente indisponível. Tentamos ${maxRetries} vezes sem sucesso. Por favor, tente novamente mais tarde.`;
        console.error(mensagemAmigavel, error);
        throw new Error(mensagemAmigavel);
      }

      // Verifica se é erro 503
      const is503 = error.status === 503 || (error.message && error.message.includes('503'));
      
      if (!is503) {
        // Se for outro erro, decide se quer tentar de novo ou falhar direto.
        // Assumindo que queremos falhar direto para erros não-503 (ex: 400, 404):
        throw error;
      }

      // 3. Lê o retryDelay do JSON ou usa o atraso base
      let baseDelay = defaultBaseDelayMs;
      if (error.response && typeof error.response.json === 'function') {
        try {
          // Tenta extrair o retryDelay do corpo da resposta, se houver
          const errorJson = await error.response.clone().json();
          if (errorJson && errorJson.retryDelay) {
            baseDelay = Number(errorJson.retryDelay);
          }
        } catch (e) {
          // Ignora falhas no parse do JSON
        }
      } else if (error.retryDelay) {
        baseDelay = Number(error.retryDelay);
      }

      // 4. Dobra o tempo de espera a cada falha subsequente (5s, 10s, 20s...)
      const exponentialDelay = Math.pow(2, attempt - 1) * baseDelay;

      // 5. Aplica variação de ±10% (Jitter) para não sincronizar com outros usuários
      const jitterAmount = exponentialDelay * 0.10; // 10%
      const minJitter = -jitterAmount;
      const maxJitter = jitterAmount;
      const randomJitter = Math.random() * (maxJitter - minJitter) + minJitter;
      
      const finalDelayMs = exponentialDelay + randomJitter;

      console.warn(
        `[Tentativa ${attempt}/${maxRetries}] Erro 503. Aguardando ${(finalDelayMs / 1000).toFixed(1)}s antes de tentar novamente...`
      );

      // Aguarda o tempo calculado
      await new Promise(resolve => setTimeout(resolve, finalDelayMs));
    }
  }
}

/**
 * Exemplo de loop principal que permite a continuidade do projeto.
 * Você pode chamar essa função no seu fluxo principal (ex: App.jsx ou no seu Controller).
 */
export async function runMainTaskLoop() {
  const tarefas = ['tarefa_1', 'tarefa_2', 'tarefa_3'];

  for (const tarefa of tarefas) {
    console.log(`\nIniciando ${tarefa}...`);
    try {
      // Integração da função com a API externa no fluxo
      const dados = await fetchWithExponentialBackoff(async () => {
        // Simula uma chamada API com o fetch
        // const response = await fetch('https://api.exemplo.com/dados');
        // if (!response.ok) throw response; // Joga a resposta para cair no catch
        // return await response.json();
        
        // Simulação de erro 503 para teste:
        const fakeError = new Error("Service Unavailable");
        fakeError.status = 503;
        // fakeError.retryDelay = 6000; // Opcional
        throw fakeError;
      });

      console.log(`Sucesso na ${tarefa}:`, dados);
    } catch (error) {
      // O loop não quebra o sistema inteiro, apenas avisa que esta tarefa falhou
      console.error(`=> Não foi possível concluir a ${tarefa}. O sistema continuará operando normalmente.`);
    }
  }
}
