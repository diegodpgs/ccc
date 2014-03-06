from flask import Flask, request, make_response
import csv
import json

app = Flask(__name__)

@app.route('/getDisciplinasPorPeriodo')
def periodo():
	with open('../../ccc2/data/grade-disciplinas-por-periodo.csv', 'rb') as csvfile:
		return montaHTML(csvfile)

@app.route('/getPreRequisito')
def periodo1():
	with open('../../ccc2/data/prereq.csv', 'rb') as csvfile:
		return montaHTML(csvfile)

@app.route('/getMaioresFrequencias')
def periodo2():
	with open('../../ccc2/data/maiores_frequencias_por_disciplina_ordenado_obrigatorias.csv', 'rb') as csvfile:
		return montaHTML(csvfile)
		

def montaJson(csvfile):
	spamreader = csv.reader(csvfile, delimiter=',',quotechar='\n')
	response = []
	colunas = []
	i = 0
	for row in spamreader:
		if (i == 0):
			for column in row:
				colunas.append(column)		
		else:
			celulas = {}
			for indexColumns in range(0,len(colunas)):
				celulas[colunas[indexColumns]] = row[indexColumns]
			response.append(celulas)
		i = i + 1;
	return response


def montaHTML(csvfile):
	response = montaJson(csvfile)
	response = make_response(json.dumps(response))
	response.headers['Access-Control-Allow-Origin'] = "*"
	return response
		
if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
