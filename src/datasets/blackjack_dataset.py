'''
Custom Dataset class from training models

Author: Matthew Uryga
'''

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset

import numpy as np
import sys
import pickle as pkl

class Blackjack_Dataset(Dataset):
	def __init__(self, data_path):
		'''
		data_path: relative path to data pickle file
		'''
		with open('data_path', 'rb') as f:
			raw_data = pickle.load(f)
			self.X = raw_data[:, :-1]
			self.y = raw_data[:, -1]

	def __len__(self):
		'''
		len function
		'''
		return len(self.X)

	def __getitem__(self, idx):
		'''
		idx: index to get values at

		will return features and labels as a tuple
		'''
		return self.X[idx], self.y[idx]