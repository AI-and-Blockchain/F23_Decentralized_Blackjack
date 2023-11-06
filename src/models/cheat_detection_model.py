'''
PyTorch implementation of a LSTM model for cheat detection

Author: urygam | Matt Uryga
'''

import torch
import torch.nn as nn
import torch.nn.functional as F
from ffn_model import FFN_Model

import numpy as np
import sys

class Cheat_Detection_Model(nn.Module):
	def __init__(self, in_len, in_dim, hidden_dims, out_dim, num_layers=2, batch_first=True):
		'''
		in_len: length of input tensor
		in_dim: dimensionality of input tensor
		hidden_dims: dimensionality of ffn hidden layers
		out_dim: dimensionality of output
		num_layers=2: number of stacked LSTM layers
		batch_first=True: swaps axes such that batches are first axis
		'''
		super().__init__()
		self.in_len = in_len

		# create input aggregator -> converts all inputs to single scalar [0, 1]
		self.input_aggregator = FFN_Model(in_dim, hidden_dims, 1)

		# create lstm, will utilize in_dim outputs from ffn
		self.lstm = nn.LSTM(in_len, 4*out_dim, num_layers=num_layers, batch_first=batch_first)

		# create ffn to process lstm output into scalar
		self.output_aggregator = FFN_Model(in_len, [in_len//4], 1)

	def forward(self, x):
		'''
		forward pass for cheat detection model

		x: input tensor of dimensionality in_dim with batch size in_len
		'''
		x = self.input_aggregator(x)

		# reshape ffn output for lstm input
		x = x.reshape(self.in_len,)

		# feed into lstm
		_, (hn, _) = self.lstm(x)

		# extract output from lstm
		x = hn[0, :, :]

		# feed into output aggregation ffn
		x = self.output_aggregator(x)

		return x