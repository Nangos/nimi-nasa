import gensim
import numpy as np
import json

model: dict[str, np.ndarray] = gensim.models.KeyedVectors.load_word2vec_format('dataset.bin.gz', binary=True)

with open("tp.json", "r") as f:
    tp_map: dict[str, list[str]] = json.load(f)

center_map: dict[str, np.ndarray] = {w: np.mean([model[w] for w in tp_map[w]], axis=0) for w in tp_map}
tp_words = list(tp_map.keys())
tp_vecs = [center_map[w] for w in tp_words]

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def least_square_regression(vecs: list[np.ndarray], vec: np.ndarray) -> np.ndarray:
    A = np.array(vecs).T
    return np.linalg.lstsq(A, vec, rcond=None)[0]

def float_to_str(x: float, precision: int) -> str:
    return f"{x:.{precision}f}"

def top_k(word: str, k: int):
    vec = model[word]
    similarities = sorted([(cosine_similarity(vec, center), w) for w, center in center_map.items()], reverse=True)
    return [(float_to_str(sim, 3), w) for sim, w in similarities[:k]]

def top_k_pairs(word: str, k: int):
    vec = model[word]
    results = []
    for i in range(len(tp_words)):
        for j in range(i + 1, len(tp_words)):
            x = least_square_regression([tp_vecs[i], tp_vecs[j]], vec)
            if x[0] < 0.0011 or x[1] < 0.0011:  # too small, (or negative), throw away
                continue
            new_vec = np.dot(x, [tp_vecs[i], tp_vecs[j]])
            sim = cosine_similarity(new_vec, vec)
            results.append((sim, tp_words[i], x[0], tp_words[j], x[1]))
    to_return = sorted(results, key=lambda x: abs(x[0]), reverse=True)[:k]
    return [(float_to_str(sim, 3), w1, float_to_str(x1, 3), w2, float_to_str(x2, 3)) for sim, w1, x1, w2, x2 in to_return]

def composition(word: str, k: int):
    vec = model[word]
    x = least_square_regression(tp_vecs, vec)
    new_vec = np.dot(x, tp_vecs)
    sim = cosine_similarity(new_vec, vec)
    top_k = sorted([(x[i], tp_words[i]) for i in range(len(x))], key=lambda x: abs(x[0]), reverse=True)[:k]
    top_k = [(x, w) for x, w in top_k if abs(x) > 0.0011]
    return float_to_str(sim, 3), [(float_to_str(x, 3), w) for x, w in top_k]

def print_list(l: list[str]) -> None:
    for w in l:
        print(w)

def check(word: str) -> bool:
    return word in model


if __name__ == "__main__":  # for testing
    import sys
    word = "mall"
    if len(sys.argv) > 1:
        word = sys.argv[1]
    if not check(word):
        print(f"{word} not found in the dataset")
        sys.exit(1)
    print_list(top_k(word, 5))
    print_list(top_k_pairs(word, 5))
    sim, tops = composition(word, 5)
    print(sim, type(sim))
    print_list(tops)
