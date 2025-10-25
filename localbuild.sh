rsync -av ./ ../_site --exclude=.git
cd ../_site
python3 build.py