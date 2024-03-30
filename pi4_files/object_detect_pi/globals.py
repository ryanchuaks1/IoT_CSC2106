import time

x = 0
y = 0
curr_t = 0

def update_values(new_x, new_y):
    global x, y, curr_t
    x = new_x
    y = new_y
    curr_t = time.time()

def get_x():
    return x

def get_y():
    return y

def get_time():
    return curr_t
