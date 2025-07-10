from fastapi import FastAPI
from .database import init_db
from .routers import team

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(team.router)

@app.get("/")
def read_root():
    return {"message": "Team.försvarsmakten backend is running!"}
