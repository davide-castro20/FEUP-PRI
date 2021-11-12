#runs all needed targets to setup the project
all: setup_dependencies get_dataset data_preprocessing


#installs all dependencies and libs python needs to run data preprocessing
.PHONY: setup_dependencies
setup_dependencies:
	sudo apt install python3-pip
	pip3 install gdown pandas seaborn numpy matplotlib sklearn 


#creates needed folders to hold the data
.PHONY: create_dir
create_dir:
	mkdir -p datasets
	mkdir -p clean_datasets

#makes data preprocessing
#this preprocessing does the following changes to the dataset:
#	-Change steam.csv English column to bools from binary values
#	-Change date format to Portuguese format
#	-Remove html tags from games descriptions
#	-Remove html tags from requirements and clean up requirements data from JSON format
#	-Transform platforms column into boolean columns
#	-Transform Category data to bool
#	-Transform Genres data to bool
#	-Drop unnecessary columns
#	-Separated minimum and recommended requirements into different columns
#	-Handle multiple developers for one App
.PHONY: data_preprocessing
data_preprocessing:
	python3 data_preprocessing.py


#gets all datasets needed to run our program from a public google drive folder. Prior to this, we obtained all csv files from 
#kaggle but decided to save them on a drive to simplify the makefile
.PHONY: get_dataset
get_dataset: steam_description_data.csv steam_requirements_data.csv steam_support_info.csv steam.csv steamspy_tag_data.csv steam_achievements.csv

#all the following target are responsible for downloading the csv corresponding to the target's name
steam_description_data.csv: create_dir
	gdown --id "1InGi0X2CDxg6R0pqoVP3R9rIi17U94oj" --output datasets/steam_description_data.csv

steam_requirements_data.csv: create_dir
	gdown --id "1elvWakbwFL_6nbmoYfOVqOY8gGNXIZp-" --output datasets/steam_requirements_data.csv

steam_support_info.csv: create_dir
	gdown --id "1meXYZhQkFX0D1ewL_BGRQb8q9oan0Rqn" --output datasets/steam_support_info.csv

steam.csv: create_dir
	gdown --id "1q01Z4HqnuEpKtgqYpu0qPXSlyoNYgn05" --output datasets/steam.csv

steamspy_tag_data.csv: create_dir
	gdown --id "14saWIOHw9CxyM5HooQBSCW9a-QJpkqZU" --output datasets/steamspy_tag_data.csv

steam_achievements.csv: create_dir
	gdown --id "1mrbIu1mdi4htuJpF88wlfatFq-755fc8" --output datasets/steam_achievements.csv

#removes all created folders
clean:
	rm -rf datasets
	rm -rf clean_datasets

