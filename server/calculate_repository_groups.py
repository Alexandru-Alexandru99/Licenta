# from copy import deepcopy

# def _remove_from_rows(element, m):
#     for key, values in m.items():
#         m[key] = list([val for val in values if val != element])
#     return m

# def _remove_rows_without(value, m):
#     m_ = m.copy()
#     for key, values in m_.items():
#         if value not in values:
#             del m[key]
#     return m

# def _remove_smaller_keys(value, m):
#     keys = sorted(m.keys())
#     for key in keys:
#         if key < value:
#             del m[key]
#         else:
#             break
#     return m

# def recursive(m, group, clusters):
#     key = group[-1]
#     m_ = deepcopy(m)

#     values = m_.pop(key)
#     m_ = _remove_rows_without(key, m_)
#     m_ = _remove_from_rows(key, m_)
#     m_ = _remove_smaller_keys(key, m_)

#     if not m_:
#         return group
#     for value in values:
#         if value not in m_ or value < key:
#             continue
#         group_ = group + [value]
#         clusters.append(recursive(m_, group_, clusters))
#     return []

# def start(m):
#     groups = []
#     for i in range(len(m)):
#         group = [i]
#         output = recursive(m, group, groups)
#         del m[i]
#         if output:
#             groups.append(output)
#     unique_groups = [val for val in groups if not
#                  any(set(val) < set(i) for i in groups)]
#     return unique_groups

# matrix_ = [[1, 2, 4, 5, 7, 9],
#           [0, 2, 5, 6, 8, 9],
#           [0, 1, 3, 5, 6, 8],
#           [2, 4, 6, 7, 8],
#           [0, 3, 5, 6, 8, 9],
#           [0, 1, 2, 4, 6, 7],
#           [1, 2, 3, 4, 7, 8],
#           [0, 3, 5, 6, 9],
#           [1, 2, 3, 4, 6, 9],
#           [0, 1, 4, 7, 8]]

# matrix = dict()
# for i, values in enumerate(matrix_):
#     matrix[i] = values

# print(start(matrix))

from sklearn.cluster import DBSCAN
from sklearn.datasets.samples_generator import make_blobs
import networkx as nx
import scipy.spatial as sp

def cluster(data, epsilon,N): #DBSCAN, euclidean distance
    db     = DBSCAN(eps=epsilon, min_samples=N).fit(data)
    labels = db.labels_ #labels of the found clusters
    n_clusters = len(set(labels)) - (1 if -1 in labels else 0) #number of clusters
    clusters   = [data[labels == i] for i in range(n_clusters)] #list of clusters
    return clusters, n_clusters

centers = [[1, 1,1], [-1, -1,1], [1, -1,1]]
X,_ = make_blobs(n_samples=N, centers=centers, cluster_std=0.4,
                            random_state=0)
cluster(X,epsilon,N)