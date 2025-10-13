graph = pydot.Dot(graph_type='digraph')

# Add nodes
node_person = pydot.Node('Person', shape='box')
node_student = pydot.Node('Student', shape='box')
node_teacher = pydot.Node('Teacher', shape='box')

# Add nodes to the graph
graph.add_node(node_person)
graph.add_node(node_student)
graph.add_node(node_teacher)

# Add edges (inheritance)
graph.add_edge(pydot.Edge(node_person, node_student))
graph.add_edge(pydot.Edge(node_person, node_teacher))

# Render the graph
graph.write_png('class_diagram.png')
