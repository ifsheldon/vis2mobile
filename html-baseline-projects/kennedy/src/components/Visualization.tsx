import { data } from "@/lib/data";

export function Visualization() {
  const minVal = 35;
  const maxVal = 95;
  const range = maxVal - minVal;

  const getPosition = (val: number) => {
    return ((val - minVal) / range) * 100;
  };

  const gridValues = [40, 50, 60, 70, 80, 90];

  return (
    <div className="w-full h-full bg-white p-4 text-[#222] overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold leading-tight mb-2">
          In close decisions, Kennedy voted in the majority 76 percent of the
          time.
        </h1>
        <p className="text-sm text-[#999]">
          Percentage of votes in the majority,
          <br />
          over each justice&rsquo;s career
        </p>
      </div>

      <div className="relative">
        {/* Header Axis Labels */}
        <div className="flex items-center mb-2 text-xs text-gray-500 relative h-6 pl-24 pr-8">
          <div className="absolute left-24 right-8 top-0 bottom-0">
            {gridValues.map((val) => (
              <div
                key={val}
                className="absolute top-0 text-center transform -translate-x-1/2"
                style={{ left: `${getPosition(val)}%` }}
              >
                {val}%
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 relative">
          {/* Background Grid Lines */}
          <div className="absolute left-24 right-8 top-0 bottom-0 pointer-events-none z-0">
            {" "}
            {gridValues.map((val) => (
              <div
                key={val}
                className="absolute top-0 bottom-0 border-l border-dashed border-[#ccc]"
                style={{ left: `${getPosition(val)}%` }}
              />
            ))}
          </div>

          {data.map((d) => (
            <div
              key={d.justice}
              className="flex items-center relative z-10 h-8"
            >
              {/* Name */}
              <div className="w-24 text-sm text-right pr-3 shrink-0 flex justify-end items-center">
                <span
                  className={`px-1.5 py-0.5 rounded ${d.highlight ? "bg-[#ffe100] font-bold" : "font-light"}`}
                >
                  {d.justice}
                </span>
              </div>

              {/* Chart Area */}
              <div className="flex-1 relative h-full">
                {/* The Dot */}
                <div
                  className="absolute top-1/2 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-black opacity-70"
                  style={{
                    left: `${getPosition(d.percentage)}%`,
                    width: "14px",
                    height: "14px",
                  }}
                ></div>
              </div>

              {/* Value Label */}
              <div
                className={`w-8 text-sm pl-1 shrink-0 ${d.highlight ? "font-bold" : "font-light"}`}
              >
                {d.percentage}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
