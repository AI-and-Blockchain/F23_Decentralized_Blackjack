import asyncio
from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pyngrok import ngrok
import uvicorn
import sys


middleware = [
	Middleware(
		CORSMiddleware,
		allow_origins=['http://localhost:3000'],
		allow_credentials=True,
		allow_methods=['*'],
		allow_headers=['*'],
		expose_headers=["*"]
	)
]

# init app
app = FastAPI(middleware=middleware)

# set port
port = sys.argv[sys.argv.index("--port") + 1] if "--port" in sys.argv else "8000"

# tunnel with ngrok
public_url = ngrok.connect(port).public_url
print("ngrok tunnel \"{}\" -> \"http://127.0.0.1:{}\"".format(public_url, port))


# get endpoint
@app.get("/get_optimal_action")
async def get_optimal_action():
	optimal_action = ''
	with open('optimal_action.txt') as f:
		optimal_action = f.readlines()[-1].strip()

	return JSONResponse(content={'optimal_action': optimal_action})