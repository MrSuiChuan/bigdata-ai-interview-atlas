from math import log2


def dcg(relevances: list[int]) -> float:
    total = 0.0
    for index, rel in enumerate(relevances, start=1):
        total += rel / log2(index + 1)
    return total


def ndcg(relevances: list[int]) -> float:
    ideal = sorted(relevances, reverse=True)
    ideal_score = dcg(ideal)
    if ideal_score == 0:
        return 0.0
    return dcg(relevances) / ideal_score


if __name__ == "__main__":
    retrieved_relevance = [3, 2, 0, 1]
    print("NDCG:", round(ndcg(retrieved_relevance), 4))