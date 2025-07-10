from fastapi import FastAPI
from .database import init_db
from .routers.team import router as team_router
from .routers.game import router as game_router

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(team_router)
app.include_router(game_router)

@app.get("/")
def read_root():
    return {"message": "Team.försvarsmakten backend is running!"}
