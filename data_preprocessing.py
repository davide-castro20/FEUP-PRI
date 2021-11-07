import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sb

df_steam = pd.read_csv('./datasets/steam.csv', index_col=0)
df_steam_tags = pd.read_csv('./datasets/steamspy_tag_data.csv', index_col=0)
df_steam_requirements = pd.read_csv('./datasets/steam_requirements_data.csv', index_col=0)
df_steam_descriptions = pd.read_csv('./datasets/steam_description_data.csv', index_col=0)
df_steam_support = pd.read_csv('./datasets/steam_support_info.csv', index_col=0)
df_steam_achievements = pd.read_csv('./datasets/steam_achievements.csv', index_col=0)