from datetime import date
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sb
import re

df_steam = pd.read_csv('./datasets/steam.csv', index_col=0)
# df_steam_tags = pd.read_csv('./datasets/steamspy_tag_data.csv', index_col=0)
# df_steam_requirements = pd.read_csv('./datasets/steam_requirements_data.csv', index_col=0)
df_steam_descriptions = pd.read_csv('./datasets/steam_description_data.csv', index_col=0)
# df_steam_support = pd.read_csv('./datasets/steam_support_info.csv', index_col=0)
# df_steam_achievements = pd.read_csv('./datasets/steam_achievements.csv', index_col=0)

# #Change steam.csv English column to bools from binary values.
# df_steam["english"] = df_steam["english"].astype(bool)

# #Change date format to Portuguese format
# df_steam['release_date'] = pd.to_datetime(df_steam['release_date']).dt.strftime('%d/%m/%Y')

#Remove html tags from games descriptions
for desc in ('about_the_game', 'detailed_description', 'short_description'):
    df_steam_descriptions[desc].replace("(<.*?>)","", regex=True, inplace=True)
    df_steam_descriptions[desc].replace("\t","", inplace=True)
    df_steam_descriptions[desc].replace("(\r)?\n","", regex=True, inplace=True)

print(df_steam_descriptions['detailed_description'].iloc[220])