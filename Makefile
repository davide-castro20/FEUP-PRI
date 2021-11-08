all: setup_dependencies get_dataset

.PHONY: setup_dependencies
setup_dependencies:
	sudo apt install python3-pip
	pip3 install gdown pandas seaborn numpy matplotlib sklearn

.PHONY: create_dir
create_dir:
	mkdir -p datasets

.PHONY: get_dataset
get_dataset: steam_description_data.csv steam_requirements_data.csv steam_support_info.csv steam.csv steamspy_tag_data.csv steam_achievements.csv

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

clean:
	rm -rf datasets
