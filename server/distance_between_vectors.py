from turtle import distance
import numpy as np
import sys

target_commits = sys.argv[1]
target_commits_per_month = sys.argv[2]
target_changes = sys.argv[3]
target_changes_per_commit = sys.argv[4]
target_changes_per_month = sys.argv[5]
target_reponame = sys.argv[6]

buffer = sys.argv[7].replace('(','')
buffer = buffer.replace(' ','')

aux = buffer.split('),')

repos = []

for i in range(len(aux)):
    aux[i] = aux[i].replace(')','')
    aux_vector = aux[i].split(',');
    repos.append(aux_vector)

distances = []

point1 = np.array((int(float(target_commits)), int(float(target_commits_per_month)), int(float(target_changes)), int(float(target_changes_per_commit)), int(float(target_changes_per_month))))

for i in range(len(repos)):
    point2 = np.array((int(float(repos[i][1])), int(float(repos[i][2])), int(float(repos[i][3])), int(float(repos[i][4])), int(float(repos[i][5]))))
    dist = np.linalg.norm(point1 - point2)
    distances.append(dist)


print(distances)