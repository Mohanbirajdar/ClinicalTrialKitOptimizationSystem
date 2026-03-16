"""
Sample training script — generates synthetic training data and trains the model.
Run this once to create an initial model.pkl before real data is available.
"""
import numpy as np
import joblib
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

np.random.seed(42)
N = 500

# Simulate features
base_demand = np.random.randint(10, 500, N).astype(float)
avg_usage = base_demand * np.random.uniform(0.6, 1.1, N)
trend = np.random.uniform(-0.2, 0.3, N)
enrollment_rate = np.random.uniform(0.3, 1.0, N)
phase = np.random.randint(0, 4, N).astype(float)
months_ahead = np.random.randint(1, 7, N).astype(float)
std_usage = avg_usage * np.random.uniform(0.05, 0.25, N)

X = np.column_stack([base_demand, avg_usage, trend, enrollment_rate, phase, months_ahead, std_usage])

# Target: actual usage (slightly noisy version of avg_usage * months)
y = avg_usage * months_ahead * (1 + trend) + np.random.normal(0, 10, N)
y = np.maximum(0, y)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

model = Ridge(alpha=1.0)
model.fit(X_train_s, y_train)

y_pred = model.predict(X_test_s)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Training complete!")
print(f"  Samples: {N} (train={len(X_train)}, test={len(X_test)})")
print(f"  MAE: {mae:.2f}")
print(f"  R²: {r2:.4f}")

joblib.dump((model, scaler), "model.pkl")
print("  Model saved to model.pkl")
