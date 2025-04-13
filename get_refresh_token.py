from google_auth_oauthlib.flow import InstalledAppFlow
import os

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret.json',
    scopes=SCOPES
)

auth_url, _ = flow.authorization_url(prompt='consent')

print("🔗 Please visit this URL to authorize the application:")
print(auth_url)

print("\n📥 After authorizing, paste the authorization code below (from browser):")
code = input("CODE: ")

creds = flow.fetch_token(code=code)
print("\n✅ Refresh token obtained successfully!")