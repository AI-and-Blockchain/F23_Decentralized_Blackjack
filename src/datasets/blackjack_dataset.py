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
	def __init__(self, data_path, stride):
		'''
		data_path: relative path to data pickle file
		'''
		with open(f'{data_path}', 'rb') as f:
			raw_data = pkl.load(f)
			self.X = raw_data[:, :-1]
			self.y = raw_data[:, -1]

		with open('datasets/expected_values.pkl', 'rb') as f:
			self.evs = pkl.load(f)

		self.stride = stride

	def __len__(self):
		'''
		len function
		'''
		return len(self.X) - self.stride

	def __getitem__(self, idx):
		'''
		idx: index to get values at

		will return features and labels as a tuple
		'''

		diff_ev = 0
		for i in range(self.stride):
			hand = self.X[idx + i]
			max_ev = np.max(self.evs[int(hand[8])][int(hand[0]), int(hand[1])])
			diff_ev += (max_ev - self.y[idx + i])

		diff_ev /= self.stride

		return self.X[idx: idx + self.stride], diff_ev