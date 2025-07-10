from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Team.försvarsmakten backend is running!"}

# Placeholder for including routers in the future
# from .routers import auth, game, team
# app.include_router(auth.router)
# app.include_router(game.router)
# app.include_router(team.router)
