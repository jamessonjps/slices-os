import time
import random

def main_task_with_retries(task_func):
    """
    Função principal que encapsula a lógica de uma tarefa
    com estratégia de Retry e Exponential Backoff.
    
    :param task_func: Função que executa a chamada de API ou lógica do agente.
    """
    max_retries = 5
    base_delay = 5  # 5 segundos iniciais
    attempt = 0

    while attempt < max_retries:
        try:
            print(f"\n[Tentativa {attempt + 1}/{max_retries}] Iniciando processo...")
            
            # Executa a tarefa passada como argumento
            resultado = task_func() 
            
            print("✓ Sucesso! Processo concluído com êxito.")
            return resultado

        except Exception as e:
            attempt += 1
            error_message = str(e).lower()

            # Captura especificamente erros de 'Service Unavailable' (503) ou capacidade esgotada
            if "service unavailable" in error_message or "503" in error_message or "capacity" in error_message:
                if attempt >= max_retries:
                    print(f"✗ Erro persistente após {max_retries} tentativas. Encerrando processo.")
                    raise Exception("Limite de retentativas atingido: Service Unavailable.")

                # Cálculo do Exponential Backoff: 5, 10, 20, 40...
                delay = base_delay * (2 ** (attempt - 1))
                
                # Adição de Jitter (Variação aleatória de +/- 10% para evitar sincronização)
                jitter = delay * 0.1
                wait_time = delay + random.uniform(-jitter, jitter)

                print(f"⚠ Erro 503 detectado (Capacidade Esgotada). Aguardando {wait_time:.2f}s antes de tentar novamente...")
                time.sleep(wait_time)
            else:
                # Se for um erro diferente (erro de sintaxe, 401, etc), interrompe o retry
                print(f"✗ Erro crítico não recuperável encontrado: {e}")
                raise e

# Exemplo de uso:
# def minha_chamada_gemini():
#     return client.generate_content("Olá!")
#
# if __name__ == "__main__":
#     main_task_with_retries(minha_chamada_gemini)
