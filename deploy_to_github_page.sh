hugo
rm -rf docs/*
cp -r public/* docs/
git add .
git commit -m "Update new version"
git push