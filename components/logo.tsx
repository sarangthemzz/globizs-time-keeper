export function LogoText() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 p-[2.4px]">
        <div className="w-full h-full rounded-[6px] bg-neutral-950 flex items-center justify-center">
          <span className="bg-gradient-to-r from-emerald-300 to-lime-200 bg-clip-text text-transparent font-bold text-3xl">G</span>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[1.8rem] leading-none font-bold bg-gradient-to-r from-emerald-300 via-green-400 to-lime-300 bg-clip-text text-transparent [-webkit-text-stroke:0.35px_rgba(2,6,23,0.7)]">
          Globizs
        </span>
        <span className="mt-0.5 text-center text-[0.52rem] font-medium uppercase leading-none tracking-[0.24em] text-slate-400">
          Time Keeper
        </span>
      </div>
    </div>
  );
}
