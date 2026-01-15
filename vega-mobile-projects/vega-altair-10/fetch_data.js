fetch("https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json")
  .then((res) => res.json())
  .then((data) => {
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
    require("fs").writeFileSync("public/population.json", JSON.stringify(data));
  });
