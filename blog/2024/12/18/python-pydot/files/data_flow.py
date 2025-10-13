graph = pydot.Dot(graph_type='digraph')

# Data sources
source1 = pydot.Node('Source 1', shape='box')
source2 = pydot.Node('Source 2', shape='box')
graph.add_node(source1)
graph.add_node(source2)

# Process nodes
process1 = pydot.Node('Process 1', shape='oval')
process2 = pydot.Node('Process 2', shape='oval')
graph.add_node(process1)
graph.add_node(process2)

# Data store
data_store = pydot.Node('Data Store', shape='cylinder')
graph.add_node(data_store)

# Edges representing data flow
graph.add_edge(pydot.Edge(source1, process1))
graph.add_edge(pydot.Edge(source2, process1))
graph.add_edge(pydot.Edge(process1, process2))
graph.add_edge(pydot.Edge(process1, data_store))
graph.add_edge(pydot.Edge(data_store, process2))

# Render the graph
graph.write_png('data_flow_diagram.png')
