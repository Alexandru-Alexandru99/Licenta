import random 
import numpy as np 
import matplotlib.pyplot as plt 
from sklearn.cluster import KMeans 
import sys

X=sys.argv[1]

lines=int(sys.argv[2])

number_of_clusters=int(sys.argv[3])

X = X.split(',')

distances = [float(x) for x in X]


columns = int(len(distances)/lines)


contor = 0;

matrix =[[0 for x in range(columns)] for y in range(lines)] # create a matrix of zeros

for i in range (0,lines):
    for j in range (0,columns):
        matrix[i][j] = distances[contor]
        contor = contor + 1


k_means = KMeans(init = "k-means++", n_clusters = number_of_clusters, n_init = 12)
k_means.fit(matrix)

k_means_labels = k_means.labels_


print(k_means_labels)