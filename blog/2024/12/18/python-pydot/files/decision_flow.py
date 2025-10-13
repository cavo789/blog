graph = pydot.Dot(graph_type='digraph')

# Add nodes
node_start = pydot.Node('Start', shape='oval')
node_process1 = pydot.Node('Process 1', shape='box')
node_decision = pydot.Node('Decision', shape='diamond')
node_process2 = pydot.Node('Process 2', shape='box')
node_end = pydot.Node('End', shape='oval')

# Add edges
graph.add_edge(pydot.Edge(node_start, node_process1))
graph.add_edge(pydot.Edge(node_process1, node_decision))
graph.add_edge(pydot.Edge(node_decision, node_process2, label='Yes'))
graph.add_edge(pydot.Edge(node_decision, node_end, label='No'))
graph.add_edge(pydot.Edge(node_process2, node_end))

# Write the graph to a file
graph.write_png('flowchart.png')
