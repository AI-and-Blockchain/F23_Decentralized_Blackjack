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
import pickle as pkl
import sys

NUM_FEATS = 9

def generate_hands(num_hands):


def main():
	hands = generate_hands(1_000)
	print(hands[:9])

	with open('sample_data.pkl', 'wb') as f:
		pkl.dump(hands, f)


if __name__ == '__main__':
	main()