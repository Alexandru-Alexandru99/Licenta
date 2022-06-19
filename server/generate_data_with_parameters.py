from dataclasses import dataclass
import random
from numpy import number
import pandas as pd
import sys

csv_name = sys.argv[1]
number_of_data = int(sys.argv[2])
commits_interval_min = int(sys.argv[3])
commits_interval_max = int(sys.argv[4])
number_of_months = int(sys.argv[5])
changes_interval_min = int(sys.argv[6])
changes_interval_max = int(sys.argv[7])
max_grade_for_x_number_of_commits = int(sys.argv[8])
max_grade_for_x_number_of_changes_per_commit = int(sys.argv[9])


def max_value_of_an_attribute(data, attribute):
    max_value = 0
    for i in range(len(data)):
        if data[i][attribute] > max_value:
            max_value = data[i][attribute]
    return max_value


data = []

for i in range(number_of_data):
    commits = random.randint(commits_interval_min, commits_interval_max)
    commits_per_month = (int)(commits / number_of_months)
    aux = random.randint(changes_interval_min, changes_interval_max)
    while(aux / (commits * 10) > 10):
        aux = random.randint(changes_interval_min, changes_interval_max)
    changes = aux
    changes_per_commit = (int)(changes / commits)
    changes_per_month = (int)(changes / number_of_months)

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
    grade_1 = (item['commits'] * 10) / max_grade_for_x_number_of_commits
    grade_2 = (item['commits_per_month'] * 10 * 100) / \
        ((100/number_of_months) * item['commits'])
    grade_3 = (item['changes_per_commit'] * 10) / \
        max_grade_for_x_number_of_changes_per_commit
    grade_4 = (item['changes_per_month'] * 10 * 100) / \
        ((100/number_of_months) * item['changes'])
    item['grade'] = round((grade_1 + grade_2 + grade_3 + grade_4)/4, 2)

df = pd.DataFrame(data)
df.to_csv('data/'+csv_name+".csv", index=False)

print("Done")
