from datetime import date
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sb
import ast


df_steam = pd.read_csv('./datasets/steam.csv', index_col=0)
df_steam_tags = pd.read_csv('./datasets/steamspy_tag_data.csv', index_col=0)
df_steam_requirements = pd.read_csv('./datasets/steam_requirements_data.csv', index_col=0)
df_steam_descriptions = pd.read_csv('./datasets/steam_description_data.csv', index_col=0)
df_steam_support = pd.read_csv('./datasets/steam_support_info.csv', index_col=0)
df_steam_achievements = pd.read_csv('./datasets/steam_achievements.csv', index_col=0)

# Change steam.csv English column to bools from binary values.
df_steam["english"] = df_steam["english"].astype(bool)

# Change date format to Portuguese format
df_steam['release_date'] = pd.to_datetime(df_steam['release_date']).dt.strftime('%d/%m/%Y')

# Drop tags and achievements columns (redundant data in the other datasets)
df_steam = df_steam.drop(columns=['steamspy_tags', 'achievements'])

# Convert interval string ('owners') to pandas interval
df_steam['owners_range'] = df_steam['owners'].apply(lambda x: pd.Interval(int(x.split('-')[0]), int(x.split('-')[1]), closed='both'))
df_steam = df_steam.drop(columns=['owners'])

# Remove html tags from games descriptions
for desc in ('about_the_game', 'detailed_description', 'short_description'):
    df_steam_descriptions[desc].replace("(<.*?>)","", regex=True, inplace=True)
    df_steam_descriptions[desc].replace("\t","", inplace=True)
    df_steam_descriptions[desc].replace("(\r)?\n","", regex=True, inplace=True)
    df_steam_descriptions[desc].replace("&quot;",'"', regex=True, inplace=True)
    df_steam_descriptions[desc].replace("&reg;",'', regex=True, inplace=True)
    df_steam_descriptions[desc].replace("&trade;",'', regex=True, inplace=True)
    df_steam_descriptions[desc].replace("&copy;",'', regex=True, inplace=True)



# Remove html tags from requirements and clean up requirements data from JSON format
def get_minimum(req):
    if("minimum" in req):
        json_obj = ast.literal_eval(req)
        minimum = json_obj['minimum']
        parts = minimum.split('Recommended')
        return parts[0]

def get_recommended(req):
    json_obj = ast.literal_eval(req)
    if 'recommended' in json_obj:
        return json_obj['recommended']
    else: 
        if('minimum' in json_obj):
            minimum = json_obj['minimum']
            parts = minimum.split('Recommended:')
            if len(parts) == 2:
                return parts[1]
            else:
                return None
        else:
            return None

for req in ('pc_requirements', 'mac_requirements', 'linux_requirements'):
    df_steam_requirements[req.replace('requirements','') + "minimum"] = df_steam_requirements[req].apply(get_minimum)
    df_steam_requirements[req.replace('requirements','') + "recommended"] = df_steam_requirements[req].apply(get_recommended)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("\t","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("</li>","; ", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("(<.*?>)","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("(\r)?\n","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("Minimum: ?","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "minimum"].replace("&reg;",'', regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("\t","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("</li>","; ", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("(<.*?>)","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("(\r)?\n","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("Recommended: ?","", regex=True, inplace=True)
    df_steam_requirements[req.replace('requirements','') + "recommended"].replace("&reg;",'', regex=True, inplace=True)
    
df_steam_requirements = df_steam_requirements.drop(columns=['pc_requirements', 'mac_requirements', 'linux_requirements', 'minimum', 'recommended'])


# Transform platforms column into boolean columns
for plat in ('windows', 'linux', 'mac'):
    df_steam[plat] = df_steam['platforms'].apply(lambda x: plat in x.split(';')) 

df_steam = df_steam.drop(columns=['platforms'])

# Transform Category data to bool
df_steam["categories"] = df_steam["categories"].str.split(";")

category_list = df_steam["categories"].explode().unique().tolist()

df_category = pd.DataFrame()

for category in category_list:
    df_category[category] = df_steam["categories"].apply(lambda x: category in x)

df_steam = df_steam.drop(columns=["categories"])

# Transform Genres data to bool
df_steam["genres"] = df_steam["genres"].str.split(";")

genre_list = df_steam["genres"].explode().unique().tolist()

df_genres = pd.DataFrame()

for genre in genre_list:
    df_genres[genre] = df_steam["genres"].apply(lambda x: genre in x)

df_steam = df_steam.drop(columns=["genres"])

# Handle multiple developers for one App
df_devs = pd.DataFrame({'appid': df_steam.index.values, 'developer': df_steam['developer'].values})
df_devs = df_devs.apply(lambda x: x.astype('str').str.split(';').explode())
df_steam = df_steam.drop(columns=['developer'])


# Save clean files
df_devs.to_csv('clean_datasets/steam_developers.csv', index=False)
df_category.to_csv('clean_datasets/steam_categories.csv')
df_steam_descriptions.to_csv('clean_datasets/steam_description_data.csv')
df_steam.to_csv('clean_datasets/steam.csv')
df_genres.to_csv('clean_datasets/steam_genres.csv')
df_steam_requirements.to_csv('clean_datasets/steam_requirements_data.csv')
df_steam_tags.to_csv('clean_datasets/steamspy_tag_data.csv')
df_steam_achievements.to_csv('clean_datasets/steam_achievements.csv')
df_steam_support.to_csv('clean_datasets/steam_support.csv')