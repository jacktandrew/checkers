class Board

	def initialize(size = 8)
		@size = size
		@board = {}
		build_board
		# puts @board
	end

	def get
		return @board
	end

	def build_board
		row = 0
		column = 0
		letters = ('a'..'z').to_a

		@size.times {
			@size.times {
				square = build_square(row, column)
				name = letters[column] + (row + 1).to_s
				@board[name.to_sym] = square
				column += 1
			}
			column = 0
			row += 1
		}
	end

	def build_square(row, column)
		square = {}
		square[:row] = row
		square[:column] = column
		square[:color] = get_color(column, row)
		square[:occupied] = false
		return square
	end

	def get_color(row, column)
		color = 'red'
		color = 'black' if column % 2 == 0 && row % 2 == 0
		color = 'black' if column % 2 != 0 && row % 2 != 0
		return color
	end
end

class Men
	def initialize(board, player)
		get_team_size board
		player[:men] = assign_men(board, player)
	end

	def assign_men(board, player)
		men = []
		far_side = @length - @height

		board.each do |name, square|
			row = square[:row]

			if (row < @height || row >= far_side)
				if (square[:color] == 'black' && square[:occupied] == false)
					square[:occupied] = true
					man = {}
					man[:alive] = true
					man[:name] = name
					man[:row] = square[:row]
					man[:column] = square[:column]
					men.push man
					@team_size -= 1
				end
			end

			return men if @team_size == 0
		end
	end

	def get_team_size(board)
		@length = Math.sqrt board.length
		neutral_zone = 1
		@height = @length / 2 - neutral_zone
		@team_size = @length * @height / 2
	end
end

board = Board.new 8

player_red = {}
player_red[:color] = 'red'

player_black = {}
player_black[:color] = 'black'

Men.new(board.get, player_red)
Men.new(board.get, player_black)

puts player_red[:men]
puts player_black[:men]
