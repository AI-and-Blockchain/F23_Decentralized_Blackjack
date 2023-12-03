'''
PyTorch implementation of a simple FFN model for aggregation of inputs

Author: urygam | Matt Uryga
'''

import torch
import torch.nn as nn
import torch.nn.functional as F

import numpy as np
import sys

class FFN_Model(nn.Module):
	def __init__(self, in_dim, hidden_dims, out_dim):
		'''
		in_dim: dimensionality of input tensor
		hidden_dims: list of dimensionalities of hidden layers, None if no hidden layers
		out_dim: dimensionality of output
		'''

		super().__init__()

		# if no hidden layers create single layer
		if hidden_dims is None or len(hidden_dims) == 0:
			layers = [nn.Linear(in_dim, out_dim)]

		# otherwise create layers with hidden_dims dimensions
		else:
			# input layer
			layers = [nn.Linear(in_dim, hidden_dims[0])]

			# hidden layers
			for i in range(len(hidden_dims)-1):
				layers.append(nn.Linear(hidden_dims[i], hidden_dims[i+1]))

			# final layer
			layers.append(nn.Linear(hidden_dims[-1], out_dim))

		# create ModuleList
		self.layers = nn.ModuleList(layers)

	def forward(self, x):
		'''
		forward pass for FFN

		x: input tensor of dimensionality in_dim
		'''

		# feed input through all but last layer
		# using ReLU as activation function
		for l in self.layers[:-1]:
			x = F.relu(l(x))

		# last layer use sigmoid as activation function
		# output should be scalar from 0 to 1
		x = self.layers[-1](x)

		return torch.sigmoid(x)