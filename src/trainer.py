'''
PyTorch implementation of a model training script

Author: urygam | Matt Uryga
'''

import numpy as np
import sys
from tqdm import tqdm
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader
import matplotlib.pyplot as plt

from datasets.blackjack_dataset import Blackjack_Dataset
from models.cheat_detection_model import Cheat_Detection_Model
from models.odds_tailoring_model import Odds_Tailoring_Model

batch_size = 64
learning_rate = 0.000005
progress_bar = True
num_epochs = 4

def main():
	device = f'cuda:0' if torch.cuda.is_available() else 'cpu'
	print(f"using device: {device}")

	# create datasets
	train_dataset = Blackjack_Dataset('datasets/train_data.pkl', batch_size)
	test_dataset = Blackjack_Dataset('datasets/test_data.pkl', batch_size)

	# create dataloaders
	train_loader = DataLoader(dataset=train_dataset, batch_size=batch_size, drop_last=True)
	test_loader = DataLoader(dataset=test_dataset, batch_size=batch_size, drop_last=True)

	# initialize model
	model = Cheat_Detection_Model(64, 9, [9, 16, 4], 16).to(device)
	model.train()

	# init optimizer
	optimizer = optim.Adam(model.parameters(), lr = learning_rate)

	# init loss func
	loss_func = nn.MSELoss()

	losses = []

	# training loop
	for epoch in range(num_epochs):
		sum_loss = 0

		for batch_idx, (x, labels) in enumerate(tqdm(train_loader, disable=not progress_bar, leave=True)):
			# send data to gpu
			x, labels = x.to(device).float(), labels.to(device).float()

			# zero out gradients
			optimizer.zero_grad()

			# forward pass
			preds = model(x)

			# calculate loss using MSE
			loss = loss_func(preds, labels)

			# backward pass
			loss.backward()

			# for calculation of per item loss
			sum_loss += loss.item()

			optimizer.step()

		losses.append(sum_loss)

		print(f'Epoch {epoch:02d}: Train loss = {sum_loss/batch_idx/batch_size:.6f}')

	# plot loss
	plt.plot(losses)
	plt.title('Loss Over Time')
	plt.xlabel('Epoch')
	plt.ylabel('Sum Loss')
	plt.show()

	checkpoint = {
		'epoch': epoch,
		'loss': sum_loss,
		'state_dict': model.state_dict(),
		'optimizer': optimizer.state_dict(),
	}
	torch.save(checkpoint, f'cheat_detection_model.pth')



if __name__ == '__main__':
	main()