'''
Data generation for use in training models


Features (9 total):
	0 | Player total
	1 | Dealer card
	X | Binary node for each possible action
	2 | 	Stay
	3 | 	Hit
	4 | 	Double
	5 | 	Split
	6 | 	Surrender
	7 | Relative bet size (as compared to running average)
	8 | True count (running count divided by remaining decks in shoe)

Label is a scalar from 0 to 1 representing the % under optimal


Author: Matthew Uryga
'''

import numpy as np
from tqdm import tqdm
import pickle as pkl
import sys

def generate_hands(num_hands, evs):
	'''
	function to generate hands and labels
	'''
	# create output matrix
	hands = np.zeros((num_hands, 10))

	# generate hand by hand
	for i in tqdm(range(num_hands)):
		# player total
		hands[i, 0] = np.random.randint(27)

		# dealer card
		hands[i, 1] = np.random.randint(13)

		# choose action
		action = None

		# if player total is even, allow split
		if hands[i, 0] >= 9 and (hands[i, 0] - 5) % 2 == 0 and (hands[i, 0] - 5) >= 4:
			action = np.random.randint(5)
			hands[i, action+2] = 1
		# otherwise do not allow split
		else:
			action = np.random.randint(4)

			# adjust for indices
			if action == 3:
				action = 4
			hands[i, action+2] = 1

		# relative bet size
		# generate betsize based on normal distribution around 1
		bet = np.random.normal(1, 0.33)

		# clip minimum bet size
		if bet <= 0.1:
			bet = 0.1

		hands[i, 7] = bet

		# true count from -8 to 8 inclusive
		hands[i, 8] = np.random.randint(17) - 8

		# attach label from EVS
		ev = evs[int(hands[i, 8])][int(hands[i, 0]), int(hands[i, 1])]

		hands[i, 9] = ev[action]
	return hands


def main():
	# load expected value matrix
	evs = None
	with open('expected_values.pkl', 'rb') as f:
		evs = pkl.load(f)

	# generate hands
	hands = generate_hands(10_000, evs)

	# dump to file
	with open('train_data.pkl', 'wb') as f:
		pkl.dump(hands, f)


if __name__ == '__main__':
	main()