module.exports = function(grunt) {

	grunt.initConfig({

		/**
		 * configuration files
		 */
		pkg: grunt.file.readJSON('package.json'),



		/**
		 * Cleans dirs
		 */
		clean: {
			dist: 'dist/*',
			docs: 'docs/*'
		},


		/**
		 * Uglify task
		 */
		uglify: {
			options: {
				mangle: true,
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.homepage %> | <%= grunt.template.today("yyyy-mm-dd") %> */',
				compress: {
					unused: false,
					drop_console: true,
					keep_fargs: true
				}
			},
			dist: {
				files: {
					'dist/WriteAndTag.min.js': ['src/WriteAndTag.js']
				}
			}
		},


		/**
		 * jsDoc task
		 */
		jsdoc : {
			docs : {
				options: {
					configure : "jsdoc.json"
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-jsdoc');


	/**
	 * Create distribution code
	 */
	grunt.registerTask('task.distribution', [
		'clean:dist',
		'uglify:dist'
	]);


	/**
	 * Create documentation
	 */
	grunt.registerTask('task.documentation', [
		'clean:docs',
		'jsdoc:docs'
	]);
	
};