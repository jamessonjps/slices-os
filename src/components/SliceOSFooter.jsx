export default function SliceOSFooter({ dark = false }) {
  return (
    <div className={`text-center py-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
      Powered by <span className="font-semibold tracking-wide">SliceOS</span>
    </div>
  );
}