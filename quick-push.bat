@echo off
echo Adding changes...
git add .

echo Committing changes...
set "timestamp=%DATE% %TIME%"
git commit -m "chore: deployment sync [%timestamp%]"

echo Pushing to GitHub...
git push

echo Done!
pause
