from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI(title="Battery Data API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "battery_database.db"

SOH_VALUES = {
    5308: round((2992.02 / 3000) * 100, 2),
    5329: round((2822.56 / 3000) * 100, 2),
}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/cells")
def get_all_cells():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT cell_id FROM battery_data ORDER BY cell_id")
    rows = cur.fetchall()
    conn.close()
    return [row["cell_id"] for row in rows]

@app.get("/soh/{cell_id}")
def get_soh(cell_id: int):
    soh = SOH_VALUES.get(cell_id)
    if soh is None:
        raise HTTPException(status_code=404, detail="Cell not found")
    return {"cell_id": cell_id, "soh": soh}

@app.get("/voltage/{cell_id}")
def get_voltage(cell_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT time, voltage FROM battery_data WHERE cell_id = ? AND rowid % 30 = 0 ORDER BY time", (cell_id,))
    rows = cur.fetchall()
    conn.close()
    return [{"time": r["time"], "voltage": r["voltage"]} for r in rows]

@app.get("/current/{cell_id}")
def get_current(cell_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT time, current FROM battery_data WHERE cell_id = ? AND rowid % 30 = 0 ORDER BY time", (cell_id,))
    rows = cur.fetchall()
    conn.close()
    return [{"time": r["time"], "current": r["current"]} for r in rows]

@app.get("/temperature/{cell_id}")
def get_temperature(cell_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT time, temperature FROM battery_data WHERE cell_id = ? AND rowid % 30 = 0 ORDER BY time", (cell_id,))
    rows = cur.fetchall()
    conn.close()
    return [{"time": r["time"], "temperature": r["temperature"]} for r in rows]

@app.get("/capacity/{cell_id}")
def get_capacity(cell_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT time, capacity FROM battery_data WHERE cell_id = ? AND rowid % 30 = 0 ORDER BY time", (cell_id,))
    rows = cur.fetchall()
    conn.close()
    return [{"time": r["time"], "capacity": r["capacity"]} for r in rows]

@app.get("/data/{cell_id}")
def get_data(cell_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM battery_data WHERE cell_id = ? AND rowid % 30 = 0 ORDER BY time", (cell_id,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
