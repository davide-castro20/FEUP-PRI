import pandas as pd

df_devs = pd.read_csv('clean_datasets/steam_developers.csv')
df_pubs = pd.read_csv('clean_datasets/steam_publishers.csv', index=False)
df_category = pd.read_csv('clean_datasets/steam_categories.csv')
df_steam_descriptions = pd.read_csv('clean_datasets/steam_description_data.csv')
df_steam = pd.read_csv('clean_datasets/steam.csv')
df_genres = pd.read_csv('clean_datasets/steam_genres.csv')
df_steam_requirements = pd.read_csv('clean_datasets/steam_requirements_data.csv')
df_steam_tags = pd.read_csv('clean_datasets/steamspy_tag_data.csv')
df_steam_achievements = pd.read_csv('clean_datasets/steam_achievements.csv')
df_steam_support = pd.read_csv('clean_datasets/steam_support.csv')






df_steam.to_json("solr_datasets/steam.json", index=False, orient="table")