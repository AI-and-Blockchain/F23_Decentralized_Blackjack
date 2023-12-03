'''
Script to calculate all possible scenarios for blackjack hands.
For use in data_generator


Creates a dict with keys from -8 to +8 (0) representing true count
Each dict value is a matrix representing optimality of each action
Dimensions:
	0 | Player total
	1 | Dealer card
	2 | List of expected values
		0 | Stay
		1 | Hit
		2 | Double
		3 | Split
		4 | Surrender


Author: Matthew Uryga
'''

import numpy as np
import pickle as pkl
import sys
from tqdm import tqdm

cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]
STAY_ITER = 5000

def calc_new_total(total, card, is_soft):
	'''
	function to calculate new total and hardness given parameters

	returns new total and is_soft
	'''

	# if at 21, all hits will bust
	if total == 21:
		return 0, False

	# if hand is soft to start
	if is_soft:
		# and card is an ace
		if card == 11:
			# if is_soft 20 and hit ace, set hard
			if total == 20:
				return 21, False
			# else will stay is_soft
			else:
				return total + 1, True
		# and card is not an ace
		else:
			# if causes bust, set hard
			if total + card > 21:
				return total + card - 10, False
			# else stay is_soft
			else:
				return total + card, True
	# if hand is hard to start
	else:
		# and card is ace
		if card == 11:
			# add 1 if 11 causes to bust, otherwise add 11 and set is_soft
			if total + card > 21:
				return total + 1, False
			else:
				return total + card, True
		# and card is not an ace
		else:
			# if causes to bust
			if total + card > 21:
				return 0, False
			# else set new total
			else:
				return total + card, False

	# should not get here
	return None

def generate_cards_from_count(tc):
	'''
	function to generate matrix of expected values from true count
	'''

	# create output matrix
	evs = np.zeros((27, 13, 5))

	# loop over every possible player total
	# note that loops are done in reverse so that when calculating
	# hit EV, the average of higher totals can be used
	for i in tqdm(reversed(range(evs.shape[0])), leave=False, total = 27):
		# extract total from matrix indices
		if i < 9:
			is_soft = True
			pt = i + 12
		else:
			is_soft = False
			pt = i - 5

		# loop over every possible dealer card
		for j in range(evs.shape[1]):
			if j < 8:
				dc = j + 2
			elif j < 12:
				dc = 10
			else:
				dc = 11

			# ---------- BEGIN EV CALCS ----------
			# STAY
			# simulates all possible dealer outcomes
			running_ev = np.zeros(STAY_ITER)

			# create probability array for random selection
			# this accounts for true count
			p = np.ones(13) / 13
			p[0:5] = (20 - tc) / 52 / 5
			p[8:] = (20 + tc) / 52 / 5
			for x in range(STAY_ITER):
				# set up variables
				d = dc
				soft = dc == 11

				# continue hitting dealer hand until bust or >= 17
				while d < 17 and d != 0:
					card = np.random.choice(cards, p=p)
					d, soft = calc_new_total(d, card, soft)

				# if dealer busts or player ends with higher total, ev +1
				if d == 0 or pt > d:
					running_ev[x] = 1
				# if push, ev is 0
				elif d == pt:
					running_ev[x] = 0
				# otherwise, ev -1
				else:
					running_ev[x] = -1

			evs[i, j, 0] = np.mean(running_ev)

			# HIT
			running_ev = np.zeros(13)

			# simulate hitting each card
			for x, card in enumerate(cards):
				new_pt, soft = calc_new_total(pt, card, is_soft)

				# if new card causes bust, EV -1
				if new_pt == 0:
					running_ev[x] = -1
					continue

				# convert to matrix indices
				if soft:
					new_pt -= 12
				else:
					new_pt += 5

				# if not bust, use best action's ev from new total
				running_ev[x] = np.max(evs[new_pt, j])

			# set average EV, weighted for true count
			running_ev *= p * 13
			evs[i, j, 1] = np.mean(running_ev)


			# DOUBLE
			# same as HIT but will not use new total's best EV
			# it will instead use new total's stand EV, doubled
			for x, card in enumerate(cards):
				new_pt, soft = calc_new_total(pt, card, is_soft)

				# if new card causes bust, EV -2
				if new_pt == 0:
					running_ev[x] = -2
					continue

				# convert to matrix indices
				if soft:
					new_pt -= 12
				else:
					new_pt += 5

				# if not bust, use stay ev from new total
				running_ev[x] = 2 * evs[new_pt, j, 0]

			# set average EV, weighted for true count
			running_ev *= p * 13
			evs[i, j, 2] = np.mean(running_ev)

			# SPLIT
			# Cannot fill until after
			# Will calculate split EV after all other EV calculations
			evs[i, j, 3] = -1

			# SURRENDER
			# EV for surrender is always -0.5
			evs[i, j, 4] = -0.5

	for i in reversed(range(evs.shape[0])):
		# extract total from matrix indices
		if i < 9:
			is_soft = True
			pt = i + 12
		else:
			is_soft = False
			pt = i - 5

		# loop over every possible dealer card
		for j in range(evs.shape[1]):
			if j < 8:
				dc = j + 2
			elif j < 12:
				dc = 10
			else:
				dc = 11

			# SPLIT
			# cannot split soft totals
			if is_soft:
				evs[i, j, 3] = -1
				continue

			new_i = i - 5

			# cannot split odd totals
			if new_i % 2 != 0 or new_i < 2:
				evs[i, j, 3] = -1
				continue

			# otherwise, EV is best option of split total times 2
			evs[i, j, 3] = 2 * max(np.max(evs[new_i//2 + 5, j, :2]), np.max(evs[new_i//2 + 5, j, 3:]))

	return evs


def test():
	x = generate_cards_from_count(0)
	print(x[8, 5])


def main():
	evs = {}
	for i in tqdm(range(-8, 9)):
		evs[i] = generate_cards_from_count(i)

	with open('expected_values.pkl', 'wb') as f:
		pkl.dump(evs, f)

if __name__ == '__main__':
	test()
