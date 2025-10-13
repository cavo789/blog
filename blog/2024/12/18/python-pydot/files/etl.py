graph = pydot.Dot(graph_type='digraph', rankdir='TB')

node_csv = pydot.Node('CSV', shape='box', style='filled', fillcolor='lightblue')
node_json = pydot.Node('JSON', shape='box', style='filled', fillcolor='lightblue')

node_extract = pydot.Node('Extract', shape='box')

node_clean = pydot.Node('Clean', shape='box')
node_transform = pydot.Node('Transform', shape='box')

node_load = pydot.Node('Load', shape='box', style='filled', fillcolor='lightgreen')

graph.add_edge(pydot.Edge(node_csv, node_extract))
graph.add_edge(pydot.Edge(node_json, node_extract))
graph.add_edge(pydot.Edge(node_extract, node_clean))
graph.add_edge(pydot.Edge(node_clean, node_transform))
graph.add_edge(pydot.Edge(node_transform, node_load))

node_enrich = pydot.Node('Get more data', shape='box')
graph.add_edge(pydot.Edge(node_transform, node_enrich))
graph.add_edge(pydot.Edge(node_enrich, node_load))

graph.write_png('etl.png')
