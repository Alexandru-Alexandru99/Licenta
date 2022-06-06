import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LinearRegression
import random
import sys

data = pd.read_csv('list.csv')

train_frame, test_frame = train_test_split(data, test_size=0.2, random_state=42)

grade = train_frame['grade'].copy()

train_frame.drop('grade',axis='columns',inplace=True)

#! my data

# commits = random.randint(1,100)
# commits_per_month = (int)(commits/6)
# changes = random.randint(100,3000)
# changes_per_commit = (int)(changes / commits)
# changes_per_month = (int)(changes / 6)

commits = sys.argv[1]
commits_per_month = sys.argv[2]
changes = sys.argv[3]
changes_per_commit = sys.argv[4]
changes_per_month = sys.argv[5]

lst = [[commits, commits_per_month, changes, changes_per_commit, changes_per_month]]
  
my_data = pd.DataFrame(lst)

model = LinearRegression()
model.fit(train_frame, grade)

# print(model)
# print(model.score(train_frame, grade))
# print(train_frame.head(5))

print(model.predict(my_data))
