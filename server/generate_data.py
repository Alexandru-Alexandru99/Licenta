from dataclasses import dataclass
import random
import pandas as pd

def max_value_of_an_attribute(data, attribute):
    max_value = 0
    for i in range(len(data)):
        if data[i][attribute] > max_value:
            max_value = data[i][attribute]
    return max_value

data = []

for i in range(20000):
    commits = random.randint(10,50)
    commits_per_month = (int)(commits / 5)
    aux = random.randint(100,5000)
    while(aux / (commits * 10) > 10):
        aux = random.randint(100,5000)
    changes = aux
    changes_per_commit = (int)(changes / commits)
    changes_per_month = (int)(changes / 5)

    data.append({
        'commits': commits, 
        'commits_per_month': commits_per_month, 
        'changes': changes, 
        'changes_per_commit': changes_per_commit, 
        'changes_per_month': changes_per_month,
    })

max_commits = max_value_of_an_attribute(data, 'commits')
max_commits_per_month = max_value_of_an_attribute(data, 'commits_per_month')
max_changes = max_value_of_an_attribute(data, 'changes')
max_changes_per_commit = max_value_of_an_attribute(data, 'changes_per_commit')
max_changes_per_month = max_value_of_an_attribute(data, 'changes_per_month')

for item in data:
    grade_1 = (item['commits'] * 10) / 50
    grade_2 = (item['commits_per_month'] * 10 * 100) / (20 * item['commits']) 
    grade_3 = item['changes'] / (item['commits'] * 10)
    grade_4 = (item['changes_per_commit'] * 10) / 100
    grade_5 = (item['changes_per_month'] * 10 * 100) / (20 * item['changes']) 
    item['grade'] = round((grade_1 + grade_2 + grade_3 + grade_4 + grade_5)/5, 2)

df = pd.DataFrame(data)
df.to_csv('data/list.csv', index=False)
