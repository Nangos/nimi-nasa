# collect the feedbacks from the users

import time

max_feedbacks = 100000  # maximum number of feedbacks, avoid overloading the disk

def record_feedback(word: str, task_id: int, answer: str, like: bool):
    global max_feedbacks
    max_feedbacks -= 1
    if max_feedbacks < 0:  # too many feedbacks, ignore the new ones
        return
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    today = time.strftime("%Y%m%d")
    filename = f"feedbacks/{today}.csv"
    with open(filename, "a") as f:
        f.write(f"{now},{word},{task_id},{answer},{like},{max_feedbacks}\n")
