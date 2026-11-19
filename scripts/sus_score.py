"""Score real, anonymized SUS answers: python scripts/sus_score.py answers.json.

Input: [{"participante":"P01", "respuestas":[10 integers from 1 to 5]}].
No sample responses are generated or treated as participant evidence.
"""
import json
import sys


def score(answers):
    if len(answers) != 10 or any(type(value) is not int or not 1 <= value <= 5 for value in answers):
        raise ValueError('Se requieren diez respuestas enteras entre 1 y 5')
    return sum(value - 1 if index % 2 == 0 else 5 - value for index, value in enumerate(answers)) * 2.5


def evaluate(participants):
    if not participants:
        raise ValueError('No hay respuestas de participantes para evaluar')
    ids = [row['participante'] for row in participants]
    if len(set(ids)) != len(ids):
        raise ValueError('Identificadores duplicados')
    results = [{'participante':row['participante'],'sus':score(row['respuestas'])} for row in participants]
    average = sum(row['sus'] for row in results) / len(results)
    return {'resultados':results,'promedio':round(average,2),'alcanza_68':average >= 68,'participantes':len(results)}


if __name__ == '__main__':
    with open(sys.argv[1],encoding='utf-8') as stream:
        print(json.dumps(evaluate(json.load(stream)),ensure_ascii=False,indent=2))
