rsync -av ./ ../_site --exclude=.git
cd ../_site
python3 build.py
python3 build-homepage.py
python3 build-tutorials.py
python3 build-images.py