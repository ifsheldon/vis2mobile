import numpy as np
import json
from scipy.stats import norm

def generate_density_data():
    x = np.linspace(2500, 6500, 100)
    
    # Adelie: centered at 3700, sigma 400
    adelie_density = norm.pdf(x, 3700, 400)
    # Chinstrap: centered at 3750, sigma 450
    chinstrap_density = norm.pdf(x, 3750, 450)
    # Gentoo: centered at 5000, sigma 500
    gentoo_density = norm.pdf(x, 5000, 500)
    
    # Normalize or scale to match the visual (approx 0.001 - 0.002 range)
    # Scipy pdf is already a density, so it should be in that range.
    # norm.pdf(3700, 3700, 400) = 1 / (400 * sqrt(2*pi)) approx 0.001
    
    data = []
    for i in range(len(x)):
        data.append({
            "mass": int(x[i]),
            "Adelie": float(adelie_density[i]),
            "Chinstrap": float(chinstrap_density[i]),
            "Gentoo": float(gentoo_density[i])
        })
    
    with open('src/lib/data.ts', 'w') as f:
        f.write('export const data = ' + json.dumps(data, indent=2) + ';')

if __name__ == "__main__":
    generate_density_data()
