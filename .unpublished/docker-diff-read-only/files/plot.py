"""Draw one chart and save it to /out — the smallest workload that still needs fonts."""

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt

figure, axes = plt.subplots()
axes.plot([1, 2, 3], [2, 1, 3])
axes.set_title("Quarterly deliveries")
figure.savefig("/out/chart.png")

print("chart written")
