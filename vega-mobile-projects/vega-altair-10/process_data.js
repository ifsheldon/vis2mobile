const fs = require("fs");

const rawData = JSON.parse(fs.readFileSync("public/population.json", "utf8"));

const groups = {};
rawData.forEach((d) => {
  if (!groups[d.age]) {
    groups[d.age] = [];
  }
  groups[d.age].push(d.people);
});

function getPercentile(data, percentile) {
  data.sort((a, b) => a - b);
  const index = (data.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= data.length) return data[lower];
  return data[lower] * (1 - weight) + data[upper] * weight;
}

const stats = Object.keys(groups)
  .map((age) => {
    const people = groups[age];
    people.sort((a, b) => a - b);
    return {
      age: parseInt(age),
      min: Math.min(...people),
      q1: getPercentile(people, 0.25),
      median: getPercentile(people, 0.5),
      q3: getPercentile(people, 0.75),
      max: Math.max(...people),
    };
  })
  .sort((a, b) => a.age - b.age);

fs.writeFileSync("src/lib/data.json", JSON.stringify(stats, null, 2));
console.log("Processed stats for", stats.length, "age groups");
