hugo
rm -rf docs/*
cp -r public/* docs/
git add .
git commit -m "Fix CSS path"
git push