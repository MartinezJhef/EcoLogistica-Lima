"""Deploy exact validated SHA, wait for provider result; never log credentials."""
import json
import os
import time
import urllib.request

token = os.environ.get('RENDER_API_KEY')
services = [os.environ.get('RENDER_API_SERVICE_ID'), os.environ.get('RENDER_WEB_SERVICE_ID')]
if not token or not all(services):
    raise SystemExit('Configure Render account and production Secrets before deployment.')
sha = os.environ['GITHUB_SHA']
headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}


def request(path, payload=None):
    req = urllib.request.Request('https://api.render.com/v1/' + path, headers=headers,
        data=json.dumps(payload).encode() if payload is not None else None)
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


for service in services:
    deploy = request(f'services/{service}/deploys', {'commitId': sha})
    for attempt in range(120):
        state = request(f'services/{service}/deploys/{deploy["id"]}')['status']
        if state == 'live':
            print('Validated commit deployed successfully.'); break
        if state in ('build_failed', 'update_failed', 'canceled', 'pre_deploy_failed'):
            raise SystemExit('Deployment failed: ' + state)
        time.sleep(10)
    else:
        raise SystemExit('Deployment did not finish within 20 minutes.')
