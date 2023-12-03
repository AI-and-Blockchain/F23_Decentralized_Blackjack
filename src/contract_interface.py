from web3 import Web3
import json
import time
import torch
import pickle as pkl
import numpy as np

from models.cheat_detection_model import Cheat_Detection_Model

# TEMP VARIABLE FOR AI-ASSISTANCE
use_ai = True

class Game_State:
	'''
	object to parse and hold data for game state
	'''
	def __init__(self, g):
		self.player_cards = g[0][0]
		self.dealer_cards = g[1][0]
		self.status = g[2][0]
		self.bet_size = g[3][0]

		if not isinstance(self.dealer_cards, list):
			self.dealer_cards = [self.dealer_cards]

	def __repr__(self):
		s = f'Player Cards: {self.player_cards}\n'
		s += f'Dealer Cards: {self.dealer_cards}\n'
		s += f'Game Status:  {self.status}\n'
		s += f'Bet Size:     {self.bet_size}'
		return s

	def add_actions(self, actions):
		self.actions = actions

	def parse(self):
		'''
		function to parse internal representations of cards to ai model
		'''

		self.count = 0

		def sum_cards(cards):
			'''
			helper function to sum cards and track running count
			'''
			num_aces = 0
			total = 0

			# loop over each card and add to total
			for card in cards:
				if card >= 10:
					self.count -= 1
					total += 10
				elif card == 1:
					self.count -= 1
					total += 1
					num_aces += 1
				else:
					total += card
					if card < 7:
						self.count += 1

			# ensure maximal total with soft hands
			for a in range(num_aces):
				if total + 10 <= 21:
					total += 10

			return total

		self.player_total = sum_cards(self.player_cards)
		self.dealer_total = sum_cards(self.dealer_cards)

	def optimal(self):
		'''
		function to return indices of EV matrix for optimal action
		'''
		# parse totals
		self.parse()

		# determine if soft or hard total
		if 1 in self.player_cards:
			pt = self.player_total - 12
		else:
			pt = self.player_total + 5

		# align dealer card with matrix indices
		dc = self.dealer_cards[0]
		if dc == 1:
			dc == 12
		else:
			dc -= 2

		return self.count, pt, dc

class Contract_Interface:
	'''
	object to handle blockchain integration and core logic
	'''
	def __init__(self):
		'''
		initialize interface
		'''
		# API key for Infura
		infura_url = 'https://sepolia.infura.io/v3/29be0acae77c4f56af14e72df9b99dc1'

		# abi for smart contract that will be called to fetch game state from
		abi = json.load(open("abi.json"))
		auth_abi = json.load(open("auth_abi.json"))

		# contract address for primary contract
		contract_address = '0xBCf26b04b2069Cd1F670D05c811340e807De4C71'
		auth_address = '0x13Be49565C126AD6aFe76dBd22b2Aa75670240C0'

		# account address
		self.account_address = '0xe1d63A4912A8A7A2971bC16a9fd3C8448B714a5e'

		# private key for signing of transactions
		self.private_key = 'aa2dfb49e30893c7fdc21ede70f5d87aa3f67a863793d38c78c39248a60eb287'

		# initialize web3 link
		w3 = Web3(Web3.HTTPProvider(infura_url))
		self.w3 = w3

		# initialize web3 contract
		contract = w3.eth.contract(abi=abi, address=contract_address)
		self.contract = contract

		auth_contract = w3.eth.contract(abi=auth_abi, address=auth_address)
		self.auth_contract = auth_contract

		# set initial request_id
		self.request_id = -1

		# initialize and load model
		# get device
		self.device = f'cuda:0' if torch.cuda.is_available() else 'cpu'
		print(f"using device: {self.device}")

		self.data = []

		# create and load alphafold2 model from training
		self.model = Cheat_Detection_Model(64, 9, [9, 16, 4], 16).to(self.device)
		self.model.eval()
		self.model.load_state_dict(torch.load('cheat_detection_model.pth')['state_dict'])

		# load optimal action matrix for ai-assistance
		self.evs = pkl.load(open('datasets/expected_values.pkl', 'rb'))

	def get_request_id(self):
		return self.contract.functions.lastRequestId().call()

	def get_game_state(self):
		return self.contract.functions.getGameState(self.request_id).call()

	def get_game_history(self):
		# fetch request struct
		game_request = self.contract.functions.gameRequests(self.request_id).call()

		# extract player addr
		player_addr = game_request[0]
		self.player_address = player_addr

		# get history struct
		hist = self.contract.functions.getGameHistory(player_addr).call()
		for h in hist:
			if h['round'] == self.request_id:
				return h

		raise ValueError('ERROR: No relevant hand history found')

	def gen_data(self, gs):
		'''
		function to generate data for input into ai model
		each game state can create multiple data point
		'''

		def sum_cards(cards):
			'''
			helper function to sum cards
			'''
			num_aces = 0
			total = 0
			count = 0

			# loop over each card and add to total
			for card in cards:
				if card >= 10:
					count -= 1
					total += 10
				elif card == 1:
					count -= 1
					total += 1
					num_aces += 1
				else:
					total += card
					if card < 7:
						count += 1

			# ensure maximal total with soft hands
			for a in range(num_aces):
				if total + 10 <= 21:
					total += 10

			return total, count


		for i, action in enumerate(gs.actions):
			# create data vector
			x = np.zeros(9)

			# calc player total and true count of current hand
			x[0], count = sum_cards(gs.player_cards[:i+2])

			# get dealer up card
			x[1] = gs.dealer_cards[0]

			# bet size
			x[7] = gs.bet_size

			# calc count
			_, dcount = sum_cards(gs.dealer_cards)
			count += dcount

			x[8] = tcount

			if action == 'stand':
				x[2] = 1
			elif action == 'hit':
				x[3] = 1
			elif action == 'double':
				x[4] = 1
			elif action == 'split':
				x[5] = 1
			elif action == 'surrender':
				x[6] = 1

			self.data.append(x)


	def predict(self):
		'''
		function to produce a scalar representing likelihood of cheating
		'''
		# use only latest 64 hands
		data = np.asarray(self.data[-64:])

		# normalize bet sizes and calc count
		count = 0
		for i, d in enumerate(data):
			count += d[8]
			data[i] = count // 8

			# clip true count to [-8, 8]
			if data[i] < -8:
				data[i] = -8
			if data[i] > 8:
				data[i] = 8

		data[:, 7] /= (np.max(data[:, 7]) * 0.5)

		pred = self.model(data)
		return pred

	def ban_player(self, p_addr):
		'''
		function to call smart contract to ban a player by address
		'''
		txn = self.auth_contract.functions.blackList(p_addr).build_transaction({
			'gas': 70000,
			'nonce': self.w3.eth.get_transaction_count(self.account_address)
		})
		signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=self.private_key)
		self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)

	def game_loop(self):
		'''
		primary loop where game state is constantly fetched
		'''
		try:
			# continue checking until keyboard interrupt
			while True:
				# get request_id
				request_id = self.get_request_id()
				print(f'{request_id = }')

				# if request_id has changed
				if self.request_id == request_id:
					time.sleep(1)
					continue

				# update request_id
				self.request_id = request_id

				# fetch game state
				game_state = Game_State(self.get_game_state())
				print('Got State')
				print(game_state)

				# if ai-assistance is needed
				if game_state.status == 'Game in progress' and use_ai:
					# find optimal indices
					count, pt, dc = game_state.optimal()

					# extract optimal move
					idx = np.argmax(self.evs[count][pt, dc])

					# convert to action string
					optimal_action = None
					if idx == 0:
						optimal_action = 'Stand'
					elif idx == 1:
						optimal_action = 'Hit'
					elif idx == 2:
						optimal_action = 'Double'
					elif idx == 3:
						optimal_action = 'Split'
					elif idx == 4:
						optimal_action = 'Surrender'

					print(optimal_action)

				# if the game has not ended, sleep and continue loop
				if game_state.status != 'Game ended':
					continue

				# otherwise, game ended
				# append to list of game states for the ai model
				hist = self.get_game_history()
				actions = hist['actions']
				game_state.add_actions(actions)
				game_state.parse()

				# generate data from game states
				self.gen_data(game_state)

				# if there is enough data to run model
				if len(self.data) >= 64:
					# forward pass to get cheat likelihood
					pred = self.predict()

					# if over a threshold, ban player
					if pred > 1:
						self.ban_player(self.player_address)

		except KeyboardInterrupt:
			print('stopping primary game loop')

		except Exception as e:
			raise e

	def test(self):
		lastRequestId = self.contract.functions.lastRequestId().call()
		print(lastRequestId)

		x = self.contract.functions.gameRequests(lastRequestId).call()
		print(x)

def main():
	a = Contract_Interface()
	a.test()
	# a.game_loop()
	a.ban_player('0x14cE875a83a131b5b6d60ccA1AC137f40bA91d29')

if __name__ == '__main__':
	main()

'''
TODO
ai-assistance
	should send optimal play on every update when in progress
	REST endpoint
testing plan
'''